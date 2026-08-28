function About() {
    return (
        <main className="inner-page">
            <section className="page-hero">
                <p className="section-eyebrow">OUR COMMUNITY</p>
                <h1>About NSSA</h1>
                <p>
                    The Northeastern Sikh Student Association brings students together
                    through Sikhi, service, community, and cultural engagement.
                </p>
            </section>

            <section className="about-page-section">
                <div className="about-page-intro">
                    <div>
                        <p className="section-eyebrow">OUR MISSION</p>
                        <h2>Creating a space for Sikhi and community at Northeastern</h2>
                    </div>

                    <div>
                        <p>
                            NSSA works to create a welcoming community for Sikh students while
                            giving the broader Northeastern community opportunities to learn
                            about Sikh history, values, traditions, and identity.
                        </p>

                        <p>
                            Through religious, cultural, service, social, and interfaith
                            programming, we aim to strengthen connections between students
                            while contributing to the wider Northeastern and Boston
                            communities.
                        </p>

                        <p>
                            Our events are open to everyone, regardless of background or
                            familiarity with Sikhi.
                        </p>
                    </div>
                </div>

                <div className="about-pillars">
                    <article className="about-pillar">
                        <span>01</span>
                        <h2>Sikhi</h2>
                        <p>
                            Create opportunities to learn about Sikh history, philosophy,
                            traditions, and contemporary issues through discussion,
                            reflection, kirtan, and visits to the Gurdwara.
                        </p>
                    </article>

                    <article className="about-pillar">
                        <span>02</span>
                        <h2>Seva</h2>
                        <p>
                            Put the Sikh principle of selfless service into practice through
                            volunteering and service initiatives across Northeastern and the
                            greater Boston community.
                        </p>
                    </article>

                    <article className="about-pillar">
                        <span>03</span>
                        <h2>Sangat</h2>
                        <p>
                            Build a strong community where students can form friendships,
                            support one another, celebrate together, and stay connected
                            throughout their time at Northeastern.
                        </p>
                    </article>
                </div>

                <div className="what-we-do">
                    <div className="what-we-do-heading">
                        <p className="section-eyebrow">WHAT WE DO</p>
                        <h2>Community beyond the classroom</h2>
                    </div>

                    <div className="activity-grid">
                        <article>
                            <h3>Kirtan & Gurpurabs</h3>
                            <p>
                                Gather for kirtan, reflection, Gurpurab celebrations, and other
                                programming centered around Sikh tradition.
                            </p>
                        </article>

                        <article>
                            <h3>Gurdwara Visits</h3>
                            <p>
                                Visit local Gurdwaras together and help students connect with
                                the wider Sikh community in the Boston area.
                            </p>
                        </article>

                        <article>
                            <h3>Seva</h3>
                            <p>
                                Participate in volunteering and service initiatives that put
                                Sikh values into action.
                            </p>
                        </article>

                        <article>
                            <h3>Interfaith Engagement</h3>
                            <p>
                                Build relationships with other faith and cultural communities
                                across Northeastern through dialogue and collaborative events.
                            </p>
                        </article>

                        <article>
                            <h3>Social Events</h3>
                            <p>
                                Meet other students through dinners, outings, casual
                                gatherings, and other community events.
                            </p>
                        </article>

                        <article>
                            <h3>Sikh Awareness</h3>
                            <p>
                                Help the Northeastern community better understand Sikh identity,
                                history, traditions, and contemporary issues.
                            </p>
                        </article>
                    </div>
                </div>

                <div className="everyone-welcome">
                    <img src="/nssa-logo.png" alt="NSSA Logo" />

                    <div>
                        <p className="section-eyebrow">EVERYONE IS WELCOME</p>
                        <h2>You do not have to be Sikh to join us.</h2>
                        <p>
                            Whether you grew up around Sikhi, are reconnecting with your
                            faith, or simply want to learn more, NSSA welcomes you to our
                            community and our events.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default About
