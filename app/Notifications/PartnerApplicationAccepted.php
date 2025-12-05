<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PartnerApplicationAccepted extends Notification
{
    use Queueable;

    public $partner;

    /**
     * Create a new notification instance.
     */
    public function __construct($partner)
    {
        $this->partner = $partner;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'partner_id' => $this->partner->id,
            'partner_name' => $this->partner->name,
            'message' => 'Your partner application for ' . $this->partner->name . ' has been accepted!',
            'url' => route('dashboard'), // Or partner dashboard
        ];
    }
}
