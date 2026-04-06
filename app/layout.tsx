/**
 * This is the root layout for your application.
 * It will be used for setting up global components and styles.
 */
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <title>Your App Title</title>
      </head>
      <body>{children}</body>
    </html>
  );
}