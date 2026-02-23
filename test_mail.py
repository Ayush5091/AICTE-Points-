import asyncio
from app.utils.mail import send_email_async

async def test_email():
    print("Testing email sending...")
    try:
        # Note: This will only work if the SMTP credentials in .env are valid!
        result = await send_email_async(
            subject="Test Email from AICTE App",
            email_to="recipient@example.com",
            body="<p>This is a test email sent from the FastAPI backend using fastapi-mail.</p>"
        )
        print("Success:", result)
    except Exception as e:
        print("Failed to send email. Ensure that your .env file has valid SMTP credentials.")
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test_email())
