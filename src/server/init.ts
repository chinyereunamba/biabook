/**
 * Server initialization
 * This file initializes background services when the server starts
 */

// Import background services to initialize them
import "./notifications/background-processor";
import "./notifications/notification-cleanup-service";

console.log("Server initialization complete");
