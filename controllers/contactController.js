const sendEmail = async (subject, htmlContent) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not defined in environment variables.');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: ['rubaitislamrumon@gmail.com'],
            subject: subject,
            html: htmlContent
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `Failed to send email: ${response.statusText}`);
    }
    return data;
};

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required.' });
        }

        const cleanMessage = message.trim();
        const html = `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                <h2 style="color: #b057d5; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Message from Portfolio</h2>
                <p>You have received a new message from the contact form on your portfolio website:</p>
                <div style="background-color: #f9f9f9; border-left: 4px solid #b057d5; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <strong>Message:</strong><br>
                    <p style="white-space: pre-wrap; margin-top: 10px;">${cleanMessage}</p>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px;">This email was automatically generated and sent via Resend.</p>
            </div>
        `;

        await sendEmail('New Message from Portfolio', html);
        res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error in sendMessage:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error sending message.' });
    }
};

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email address is required.' });
        }

        const cleanEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        }

        const html = `
            <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                <h2 style="color: #ff8453; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Newsletter Subscription</h2>
                <p>You have a new subscriber to your portfolio newsletter:</p>
                <div style="background-color: #f9f9f9; border-left: 4px solid #ff8453; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <strong>Email:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a>
                </div>
                <p style="font-size: 12px; color: #777; margin-top: 30px;">This email was automatically generated and sent via Resend.</p>
            </div>
        `;

        await sendEmail('New Newsletter Subscription', html);
        res.status(200).json({ success: true, message: 'Subscription request sent successfully.' });
    } catch (error) {
        console.error('Error in subscribeNewsletter:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error subscribing to newsletter.' });
    }
};
