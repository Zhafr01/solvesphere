<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewNews extends Notification
{
    use Queueable;

    public $news;

    /**
     * Create a new notification instance.
     */
    public function __construct($news)
    {
        $this->news = $news;
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
            'news_id' => $this->news->id,
            'title' => $this->news->title,
            'message' => 'New news published: ' . $this->news->title,
            'url' => route('news.show', $this->news->id),
        ];
    }
}
