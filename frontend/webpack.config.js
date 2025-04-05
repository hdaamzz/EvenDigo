module.exports = {
    plugins: [
      {
        apply(compiler) {
          compiler.hooks.done.tap('CSP', () => {
            // Add CSP headers configuration
          });
        }
      }
    ],
    devServer: {
      headers: {
        'Content-Security-Policy': "font-src 'self' https://js.stripe.com"
      }
    }
  };