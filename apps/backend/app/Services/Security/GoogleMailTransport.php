<?php

namespace App\Services\Security;

use App\Exceptions\MailTransportException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

/**
 * GoogleMailTransport handles email delivery via the Gmail HTTP API.
 * This bypasses common SMTP port blocks in cloud environments like Railway using OAuth2.
 */
class GoogleMailTransport extends AbstractTransport
{
    /**
     * Create a new Google Mail transport instance.
     */
    public function __construct(protected string $token)
    {
        parent::__construct();
    }

    /**
     * Send the given message.
     */
    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());

        // Gmail API requires the message to be base64url encoded.
        $rawMessage = rtrim(strtr(base64_encode($email->toString()), '+/', '-_'), '=');

        /** @var Response $response */
        $response = Http::withToken($this->token)
            ->timeout(15)
            ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', [
                'raw' => $rawMessage,
            ]);

        if (! $response->successful()) {
            throw new MailTransportException('Gmail HTTP API Error: '.$response->body());
        }
    }

    /**
     * Get the string representation of the transport.
     */
    public function __toString(): string
    {
        return 'gmail-http';
    }
}
