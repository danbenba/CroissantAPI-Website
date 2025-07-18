/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    async rewrites() {
        return [
            {
                source: '/launcher/:path*',
                destination: '/launcher/:path*',
            },
            {
                source: '/avatar/:path*',
                destination: '/api/avatar/:path*',
            },
            {
                source: '/items-icons/:path*',
                destination: '/api/items-icons/:path*',
            },
            {
                source: '/games-icons/:path*',
                destination: '/api/games-icons/:path*',
            },
            {
                source: '/banners-icons/:path*',
                destination: '/api/banners-icons/:path*',
            },
            {
                source: '/launcher/',
                destination: '/launcher/index.html',
            },
        ];
    },
    async headers() {
        return [
            {
                source: "/oauth2/auth",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        value: "*"
                    },
                    {
                        key: "X-Frame-Options",
                        value: "ALLOWALL"
                    },
                    {
                        key: "Content-Security-Policy",
                        value: "frame-ancestors *"
                    },
                    {
                        key: "Referrer-Policy",
                        value: "no-referrer"
                    }
                ]
            }
        ];
    },
    webpack: (config, { isServer, buildId, dev, webpack }) => {
        if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            
            fs: false,
            path: false,
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
        };

        config.plugins.push(
            new webpack.ProvidePlugin({
            process: 'process/browser',
            }),
            new webpack.NormalModuleReplacementPlugin(
            /node:crypto/,
            (resource) => {
                resource.request = resource.request.replace(/^node:/, '');
            }
            )
        );
        }
        return config;
    },
};

module.exports = nextConfig;