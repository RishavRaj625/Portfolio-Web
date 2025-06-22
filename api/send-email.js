// api/send-email.js
// Vercel serverless function for sending emails
import nodemailer from 'nodemailer';

// Rate limiting store (in production, use Redis or external service)
const rateLimitStore = new Map();

// Clean up old entries every hour
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, value] of rateLimitStore.entries()) {
        if (value.timestamp < oneHourAgo) {
            rateLimitStore.delete(key);
        }
    }
}, 60 * 60 * 1000);

// Rate limiting function
function checkRateLimit(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 3; // Max 3 requests per 15 minutes per IP
    
    const key = `rate_limit_${ip}`;
    const record = rateLimitStore.get(key) || { count: 0, timestamp: now };
    
    // Reset if window expired
    if (now - record.timestamp > windowMs) {
        record.count = 0;
        record.timestamp = now;
    }
    
    record.count++;
    rateLimitStore.set(key, record);
    
    return record.count <= maxRequests;
}

// Input validation and sanitization
function validateAndSanitize(data) {
    const errors = [];
    const sanitized = {};
    
    // Name validation
    if (!data.name || typeof data.name !== 'string') {
        errors.push('Name is required');
    } else {
        sanitized.name = data.name.trim().slice(0, 100);
        if (sanitized.name.length < 2) {
            errors.push('Name must be at least 2 characters');
        }
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Valid email is required');
    } else {
        sanitized.email = data.email.trim().toLowerCase().slice(0, 254);
    }
    
    // Subject validation
    if (!data.subject || typeof data.subject !== 'string') {
        errors.push('Subject is required');
    } else {
        sanitized.subject = data.subject.trim().slice(0, 200);
        if (sanitized.subject.length < 3) {
            errors.push('Subject must be at least 3 characters');
        }
    }
    
    // Message validation
    if (!data.message || typeof data.message !== 'string') {
        errors.push('Message is required');
    } else {
        sanitized.message = data.message.trim().slice(0, 5000);
        if (sanitized.message.length < 10) {
            errors.push('Message must be at least 10 characters');
        }
    }
    
    // Optional fields
    sanitized.timestamp = data.timestamp || new Date().toISOString();
    sanitized.userAgent = (data.userAgent || '').slice(0, 500);
    sanitized.referrer = (data.referrer || '').slice(0, 500);
    
    return { errors, sanitized };
}

// Spam detection
function detectSpam(data) {
    const spamPatterns = [
        /viagra|cialis|pharmacy|casino|lottery|winner/i,
        /buy now|act now|urgent|limited time/i,
        /\$\$\$|\€\€\€|money back guarantee/i,
        /click here|visit our website/i,
        /free money|earn money fast/i,
        /sex|adult|dating|singles/i,
        /weight loss|lose weight|diet pills/i
    ];
    
    const fullText = `${data.name} ${data.email} ${data.subject} ${data.message}`.toLowerCase();
    
    // Check for spam patterns
    let spamScore = spamPatterns.reduce((score, pattern) => {
        return score + (pattern.test(fullText) ? 1 : 0);
    }, 0);
    
    // Check for excessive links
    const linkCount = (fullText.match(/http|www\./g) || []).length;
    if (linkCount > 2) spamScore += 2;
    
    // Check for suspicious characters
    const suspiciousChars = /[^\w\s@.\-!?,'":;()]/g;
    const suspiciousCount = (fullText.match(suspiciousChars) || []).length;
    if (suspiciousCount > 10) spamScore += 1;
    
    // Check for excessive caps
    const capsPercentage = (fullText.match(/[A-Z]/g) || []).length / fullText.length;
    if (capsPercentage > 0.5) spamScore += 1;
    
    // Check for repeated characters
    if (/(.)\1{4,}/.test(fullText)) spamScore += 1;
    
    return spamScore >= 2; // Consider spam if score is 2 or higher
}

// Create email transporter
function createTransporter() {
    // Gmail configuration (recommended)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
            }
        });
    }
    
    // SMTP configuration (alternative)
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    
    // SendGrid configuration
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransporter({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }
    
    throw new Error('No email configuration found');
}

// Generate HTML email template
function generateEmailHTML(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                text-align: center;
            }
            .field {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                border-radius: 4px;
            }
            .field-label {
                font-weight: bold;
                color: #555;
                margin-bottom: 5px;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            .field-value {
                color: #333;
                font-size: 14px;
                word-wrap: break-word;
            }
            .message-content {
                background: white;
                padding: 20px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                white-space: pre-wrap;
                font-family: inherit;
            }
            .metadata {
                background: #f1f3f4;
                padding: 15px;
                border-radius: 8px;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">From your portfolio website</p>
            </div>
            
            <div class="field">
                <div class="field-label">👤 Name</div>
                <div class="field-value">${escapeHtml(data.name)}</div>
            </div>
            
            <div class="field">
                <div class="field-label">📧 Email</div>
                <div class="field-value">
                    <a href="mailto:${escapeHtml(data.email)}" style="color: #667eea; text-decoration: none;">
                        ${escapeHtml(data.email)}
                    </a>
                </div>
            </div>
            
            <div class="field">
                <div class="field-label">📝 Subject</div>
                <div class="field-value">${escapeHtml(data.subject)}</div>
            </div>
            
            <div class="field">
                <div class="field-label">💬 Message</div>
                <div class="message-content">${escapeHtml(data.message)}</div>
            </div>
            
            <div class="metadata">
                <strong>📊 Submission Details:</strong><br>
                <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
                <strong>User Agent:</strong> ${escapeHtml(data.userAgent || 'Not provided')}<br>
                <strong>Referrer:</strong> ${escapeHtml(data.referrer || 'Direct')}
            </div>
            
            <div class="footer">
                <p>This email was sent from your portfolio contact form.</p>
                <p>To reply directly, just respond to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// HTML escape function
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Auto-reply HTML template
function generateAutoReplyHTML(data) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank you for contacting me!</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
                text-align: center;
            }
            .content {
                font-size: 16px;
                line-height: 1.8;
            }
            .highlight {
                background: #f8f9fa;
                padding: 20px;
                border-left: 4px solid #667eea;
                border-radius: 4px;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 24px;">✅ Message Received!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for reaching out</p>
            </div>
            
            <div class="content">
                <p>Hi ${escapeHtml(data.name)},</p>
                
                <p>Thank you for contacting me through my portfolio website! I've received your message and wanted to confirm that it arrived safely.</p>
                
                <div class="highlight">
                    <strong>📝 Your message summary:</strong><br>
                    <strong>Subject:</strong> ${escapeHtml(data.subject)}<br>
                    <strong>Sent:</strong> ${new Date(data.timestamp).toLocaleString()}
                </div>
                
                <p>I appreciate you taking the time to reach out. I'll review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
                
                <p>If your message is urgent or if you don't hear back from me within a reasonable time, feel free to reach out directly at <a href="mailto:rishav2raj78@gmail.com" style="color: #667eea;">rishav2raj78@gmail.com</a>.</p>
                
                <p>Looking forward to connecting with you!</p>
                
                <p>Best regards,<br>
                <strong>Rishav Raj</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated response. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

// Main handler function
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed. Use POST.' 
        });
    }
    
    try {
        // Get client IP for rate limiting
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection.remoteAddress || 
                        'unknown';
        
        // Check rate limit
        if (!checkRateLimit(clientIP)) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }
        
        // Validate and sanitize input
        const { errors, sanitized } = validateAndSanitize(req.body);
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
        // Check for spam
        if (detectSpam(sanitized)) {
            // Log spam attempt but don't reveal detection to sender
            console.log('Spam detected:', sanitized);
            return res.status(200).json({
                success: true,
                message: 'Message received successfully!'
            });
        }
        
        // Create email transporter
        const transporter = createTransporter();
        
        // Email to you (main notification)
        const mainEmailOptions = {
            from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
            to: process.env.EMAIL_TO || 'rishav2raj78@gmail.com',
            replyTo: sanitized.email,
            subject: `Portfolio Contact: ${sanitized.subject}`,
            html: generateEmailHTML(sanitized),
            text: `
Name: ${sanitized.name}
Email: ${sanitized.email}
Subject: ${sanitized.subject}

Message:
${sanitized.message}

---
Sent: ${new Date(sanitized.timestamp).toLocaleString()}
User Agent: ${sanitized.userAgent}
Referrer: ${sanitized.referrer}
            `.trim()
        };
        
        // Auto-reply to sender
        const autoReplyOptions = {
            from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
            to: sanitized.email,
            subject: 'Thank you for your message - Rishav Raj',
            html: generateAutoReplyHTML(sanitized),
            text: `
Hi ${sanitized.name},

Thank you for contacting me through my portfolio website! I've received your message and wanted to confirm that it arrived safely.

Your message summary:
Subject: ${sanitized.subject}
Sent: ${new Date(sanitized.timestamp).toLocaleString()}

I appreciate you taking the time to reach out. I'll review your message and get back to you as soon as possible, typically within 24-48 hours.

If your message is urgent or if you don't hear back from me within a reasonable time, feel free to reach out directly at rishav2raj78@gmail.com.

Looking forward to connecting with you!

Best regards,
Rishav Raj

---
This is an automated response. Please do not reply to this email.
            `.trim()
        };
        
        // Send both emails
        await Promise.all([
            transporter.sendMail(mainEmailOptions),
            transporter.sendMail(autoReplyOptions)
        ]);
        
        // Log successful submission
        console.log('Contact form submission successful:', {
            name: sanitized.name,
            email: sanitized.email,
            subject: sanitized.subject,
            timestamp: sanitized.timestamp,
            ip: clientIP
        });
        
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Message sent successfully! You should receive a confirmation email shortly.'
        });
        
    } catch (error) {
        console.error('Email sending error:', error);
        
        // Return generic error to client (don't expose internal details)
        return res.status(500).json({
            success: false,
            message: 'Sorry, there was an error sending your message. Please try again later.'
        });
    }
}