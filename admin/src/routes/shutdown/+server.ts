import { json } from '@sveltejs/kit';

export const POST = async () => {
    console.log("Shutting down admin server by user request...");
    
    // Delay exit slightly to allow the HTTP response to complete
    setTimeout(() => {
        process.exit(0);
    }, 500);
    
    return json({ success: true, message: 'Server shutting down' });
};
