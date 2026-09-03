import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { formatGazetteDate } from '../../lib/gazettes'
import {
  normalizeExternalUrl,
  safeExternalUrl,
} from '../../lib/externalUrls'
import {
  MAX_PDF_UPLOAD_LABEL,
  validatePdfFile,
} from '../../lib/uploadFiles'

let pdfJsPromise

async function getPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import('react-pdf').then(({ pdfjs }) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString()

      return pdfjs
    })
  }

  return pdfJsPromise
}

function cleanFileName(name) {
  return String(name || 'gazette.pdf')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .toLowerCase()
}

function fileStem(name) {
  return cleanFileName(name).replace(/\.pdf$/i, '')
}

async function renderFirstPageToJpegBlob(source) {
  const pdfjs = await getPdfJs()
  const loadingTask = pdfjs.getDocument(source)
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale: 1.7 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)

  await page.render({
    canvasContext: context,
    viewport,
  }).promise

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result)
        } else {
          reject(
            new Error('Could not create the Gazette cover image.')
          )
        }
      },
      'image/jpeg',
      0.86
    )
  })

  await pdf.destroy()

  return blob
}

async function createCoverFromFile(file) {
  const arrayBuffer = await file.arrayBuffer()

  return renderFirstPageToJpegBlob({
    data: new Uint8Array(arrayBuffer),
  })
}

async function createCoverFromUrl(url) {
  return renderFirstPageToJpegBlob(url)
}

function GazetteAdmin({ onContentChange }) {
  const [gazettes, setGazettes] = useState([])
  const [loading, setLoading] = useState(true)

  const [issueDate, setIssueDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pdfFile, setPdfFile] = useState(null)

  const [publishing, setPublishing] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadGazettes() {
    const { data, error: loadError } = await supabase
      .from('gazettes')
      .select('*')
      .order('issue_date', { ascending: false })

    if (loadError) {
      throw loadError
    }

    setGazettes(data || [])
  }

  useEffect(() => {
    async function initialLoad() {
      try {
        await loadGazettes()
      } catch (loadError) {
        console.error(loadError)
        setError('Could not load Gazette issues.')
      } finally {
        setLoading(false)
      }
    }

    initialLoad()
  }, [])

  function resetForm() {
    setIssueDate('')
    setTitle('')
    setDescription('')
    setPdfFile(null)

    const input = document.getElementById('gazette-pdf')
    if (input) {
      input.value = ''
    }
  }

  async function handlePublish(event) {
    event.preventDefault()

    setMessage('')
    setError('')

    if (!issueDate) {
      setError('Choose the issue month.')
      return
    }

    if (!title.trim()) {
      setError('Enter an issue title.')
      return
    }

    if (!pdfFile) {
      setError('Choose the Gazette PDF.')
      return
    }

    try {
      await validatePdfFile(pdfFile)
    } catch (validationError) {
      setError(validationError.message)
      return
    }

    setPublishing(true)
    setMessage(
      'Creating cover image and publishing Gazette...'
    )

    const uploadedPaths = []

    try {
      const timestamp = Date.now()
      const cleanName = cleanFileName(pdfFile.name)
      const stem = fileStem(pdfFile.name)

      const pdfPath = `pdfs/${timestamp}-${cleanName}`
      const coverPath = `covers/${timestamp}-${stem}.jpg`

      let coverBlob

      try {
        coverBlob = await createCoverFromFile(pdfFile)
      } catch (coverError) {
        throw new Error(
          `The PDF could not be processed into a cover image. ${coverError.message}`,
          { cause: coverError }
        )
      }

      setMessage('Cover created. Uploading Gazette PDF...')

      const { error: pdfUploadError } =
        await supabase.storage
          .from('gazettes')
          .upload(pdfPath, pdfFile, {
            contentType: 'application/pdf',
            upsert: false,
          })

      if (pdfUploadError) {
        throw pdfUploadError
      }

      uploadedPaths.push(pdfPath)

      const { error: coverUploadError } =
        await supabase.storage
          .from('gazettes')
          .upload(coverPath, coverBlob, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false,
          })

      if (coverUploadError) {
        throw coverUploadError
      }

      uploadedPaths.push(coverPath)

      const {
        data: { publicUrl: pdfUrl },
      } = supabase.storage
        .from('gazettes')
        .getPublicUrl(pdfPath)

      const {
        data: { publicUrl: coverUrl },
      } = supabase.storage
        .from('gazettes')
        .getPublicUrl(coverPath)

      const { error: insertError } = await supabase
        .from('gazettes')
        .insert({
          issue_date: `${issueDate}-01`,
          title: title.trim(),
          description: description.trim(),
          link: pdfUrl,
          file_path: pdfPath,
          cover_url: coverUrl,
          cover_path: coverPath,
        })

      if (insertError) {
        throw insertError
      }

      resetForm()
      await loadGazettes()
      await onContentChange?.()

      setMessage(
        'Gazette published successfully with a saved cover image.'
      )
    } catch (publishError) {
      console.error(publishError)

      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from('gazettes')
          .remove(uploadedPaths)

        if (cleanupError) {
          setError(
            `Could not publish Gazette: ${publishError.message}. Uploaded files also could not be cleaned up; check Supabase Storage for orphaned files.`
          )
          setMessage('')
          return
        }
      }

      setMessage('')
      setError(
        `Could not publish Gazette: ${publishError.message}`
      )
    } finally {
      setPublishing(false)
    }
  }

  async function handleGenerateMissingCovers() {
    const missing = gazettes.filter(
      (gazette) => !gazette.cover_url
    )

    if (missing.length === 0) {
      setError('')
      setMessage(
        'Every Gazette issue already has a saved cover.'
      )
      return
    }

    const confirmed = window.confirm(
      `Generate cover images for ${missing.length} existing Gazette issue(s)?`
    )

    if (!confirmed) return

    setBackfilling(true)
    setError('')
    setMessage(
      `Generating ${missing.length} missing cover image(s)...`
    )

    let completed = 0

    try {
      for (const gazette of missing) {
        const safePdfUrl = normalizeExternalUrl(gazette.link)

        if (!safePdfUrl) {
          throw new Error(
            `"${gazette.title}" does not have a PDF link.`
          )
        }

        const coverBlob =
          await createCoverFromUrl(safePdfUrl)

        const timestamp = Date.now()
        const coverPath =
          `covers/backfill-${gazette.id}-${timestamp}.jpg`

        const { error: uploadError } =
          await supabase.storage
            .from('gazettes')
            .upload(coverPath, coverBlob, {
              contentType: 'image/jpeg',
              cacheControl: '31536000',
              upsert: false,
            })

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl: coverUrl },
        } = supabase.storage
          .from('gazettes')
          .getPublicUrl(coverPath)

        const { error: updateError } = await supabase
          .from('gazettes')
          .update({
            cover_url: coverUrl,
            cover_path: coverPath,
          })
          .eq('id', gazette.id)

        if (updateError) {
          const { error: cleanupError } = await supabase.storage
            .from('gazettes')
            .remove([coverPath])

          if (cleanupError) {
            throw new Error(
              `${updateError.message}. The generated cover also could not be cleaned up; check Supabase Storage for an orphaned file.`,
              { cause: updateError }
            )
          }

          throw updateError
        }

        completed += 1
        setMessage(
          `Generated ${completed} of ${missing.length} cover image(s)...`
        )
      }

      await loadGazettes()

      setMessage(
        `Finished. Generated ${completed} cover image(s).`
      )
    } catch (backfillError) {
      console.error(backfillError)

      setError(
        `Stopped after ${completed} cover(s): ${backfillError.message}`
      )
    } finally {
      setBackfilling(false)
    }
  }

  async function handleDelete(gazette) {
    const confirmed = window.confirm(
      `Delete "${gazette.title}"? This removes both the PDF and its cover from the website.`
    )

    if (!confirmed) return

    setDeletingId(gazette.id)
    setError('')
    setMessage('')

    try {
      const pathsToDelete = [
        gazette.file_path,
        gazette.cover_path,
      ].filter(Boolean)

      const { error: deleteError } = await supabase
        .from('gazettes')
        .delete()
        .eq('id', gazette.id)

      if (deleteError) {
        throw deleteError
      }

      let cleanupFailed = false

      if (pathsToDelete.length > 0) {
        const { error: storageError } =
          await supabase.storage
            .from('gazettes')
            .remove(pathsToDelete)

        if (storageError) {
          console.error(storageError)
          cleanupFailed = true
        }
      }

      await loadGazettes()
      await onContentChange?.()

      setMessage(
        cleanupFailed
          ? 'Gazette issue removed, but one or more stored files could not be deleted. Remove the orphaned files from Supabase Storage or try again later.'
          : 'Gazette issue deleted.'
      )
    } catch (deleteIssueError) {
      console.error(deleteIssueError)
      setError(
        `Could not delete Gazette: ${deleteIssueError.message}`
      )
    } finally {
      setDeletingId(null)
    }
  }

  const missingCoverCount = gazettes.filter(
    (gazette) => !gazette.cover_url
  ).length

  return (
    <section className="admin-section">
      <div className="admin-section-heading">
        <div>
          <p className="section-eyebrow">
            SIKH GAZETTE
          </p>
          <h2>Manage Gazette Issues</h2>
          <p>
            Upload a PDF up to {MAX_PDF_UPLOAD_LABEL}. The first page is
            automatically saved as a fast-loading cover image.
          </p>
        </div>
      </div>

      <form
        className="admin-form"
        onSubmit={handlePublish}
      >
        <label>
          Issue Month
          <input
            type="month"
            value={issueDate}
            onChange={(event) =>
              setIssueDate(event.target.value)
            }
            required
          />
        </label>

        <label>
          Issue Title
          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="September 2026 Issue"
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="A short description of this issue."
            rows="4"
          />
        </label>

        <label>
          Gazette PDF
          <input
            id="gazette-pdf"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) =>
              setPdfFile(
                event.target.files?.[0] || null
              )
            }
            required
          />
        </label>

        <button
          type="submit"
          className="button button-blue"
          disabled={publishing}
        >
          {publishing
            ? 'Creating Cover & Publishing...'
            : 'Publish Gazette'}
        </button>
      </form>

      {message && (
        <p className="admin-message">{message}</p>
      )}

      {error && (
        <p className="admin-error">{error}</p>
      )}

      <div className="admin-section-heading">
        <div>
          <p className="section-eyebrow">
            PUBLISHED ISSUES
          </p>
          <h2>Current Gazette Archive</h2>
          <p>
            {missingCoverCount > 0
              ? `${missingCoverCount} existing issue(s) still need a saved cover image.`
              : 'All published issues have saved cover images.'}
          </p>
        </div>

        {missingCoverCount > 0 && (
          <button
            type="button"
            className="admin-secondary-button"
            onClick={handleGenerateMissingCovers}
            disabled={backfilling}
          >
            {backfilling
              ? 'Generating Covers...'
              : `Generate Missing Covers (${missingCoverCount})`}
          </button>
        )}
      </div>

      {loading && (
        <p className="admin-card-description">
          Loading Gazette issues...
        </p>
      )}

      {!loading && gazettes.length === 0 && (
        <p className="admin-card-description">
          No Gazette issues have been published yet.
        </p>
      )}

      {!loading && gazettes.length > 0 && (
        <div className="gazette-admin-list">
          {gazettes.map((gazette) => (
            <div
              className="gazette-admin-item"
              key={gazette.id}
            >
              <div>
                {gazette.cover_url && (
                  <img
                    src={gazette.cover_url}
                    alt={`${gazette.title} cover`}
                    style={{
                      width: '90px',
                      height: 'auto',
                      display: 'block',
                      marginBottom: '14px',
                      borderRadius: '6px',
                      border: '1px solid #e8e8e8',
                    }}
                  />
                )}

                <p className="gazette-admin-date">
                  {formatGazetteDate(
                    gazette.issue_date
                  )}
                </p>

                <h3>{gazette.title}</h3>

                {gazette.description && (
                  <p>{gazette.description}</p>
                )}

                {!gazette.cover_url && (
                  <p className="admin-card-description">
                    Cover image not generated yet.
                  </p>
                )}
              </div>

              <div className="gazette-admin-actions">
                {safeExternalUrl(gazette.link) ? <a
                  href={safeExternalUrl(gazette.link)}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-secondary-button"
                >
                  View PDF
                </a> : (
                  <span className="admin-card-description">
                    PDF link unavailable
                  </span>
                )}

                <button
                  type="button"
                  className="admin-delete-button"
                  onClick={() =>
                    handleDelete(gazette)
                  }
                  disabled={
                    deletingId !== null || backfilling || publishing
                  }
                >
                  {deletingId === gazette.id
                    ? 'Deleting...'
                    : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default GazetteAdmin
