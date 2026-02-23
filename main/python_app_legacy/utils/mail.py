import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', ''),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', ''),
    MAIL_FROM = os.getenv('MAIL_FROM', ''),
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587)),
    MAIL_SERVER = os.getenv('MAIL_SERVER', ''),
    MAIL_FROM_NAME = os.getenv('MAIL_FROM_NAME', 'AICTE App'),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

fm = FastMail(conf)

async def send_email_async(subject: str, email_to: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )
    
    await fm.send_message(message)
    return {"message": "email has been sent"}
