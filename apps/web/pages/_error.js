// Pages Router error page for Next.js 14 App Router compatibility.
// This prevents the default Next.js _error page from being statically
// generated during build, which would otherwise fail when it tries to
// wrap itself in the App Router root layout (ClerkProvider et al.) during
// static generation.
//
// By providing a custom Pages Router error handler, Next.js only renders
// this page when an actual error occurs at runtime, bypassing the static
// prerender that causes React error #31 in the full provider tree.

function ErrorPage({ statusCode }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                gap: '1rem',
                padding: '2rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {statusCode === 404
                    ? 'Page not found'
                    : statusCode === 500
                      ? 'Internal server error'
                      : `Error ${statusCode || 'Unknown'}`}
            </h1>
            <p style={{ color: '#666', maxWidth: '400px', margin: 0 }}>
                {statusCode === 404
                    ? 'The page you are looking for does not exist.'
                    : 'An unexpected error occurred. Please try again.'}
            </p>
            <a
                href="/"
                style={{
                    color: '#0070f3',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                }}
            >
                Go back home
            </a>
        </div>
    );
}

ErrorPage.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default ErrorPage;
