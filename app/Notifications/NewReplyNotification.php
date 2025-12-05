<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReplyNotification extends Notification
{
    use Queueable;

    protected $comment;
    protected $replier;

    /**
     * Create a new notification instance.
     */
    public function __construct($comment, $replier)
    {
        $this->comment = $comment;
        $this->replier = $replier;
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
            'type' => 'new_reply',
            'message' => $this->replier->name . ' replied to your comment.',
            'url' => '/forum/' . $this->comment->forum_topic_id,
            'comment_id' => $this->comment->id,
            'replier_id' => $this->replier->id,
            'created_at' => now(),
        ];
    }
}
