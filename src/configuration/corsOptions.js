export const corsOptions = {
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600
}