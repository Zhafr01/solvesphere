<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewForumReply extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct($topic, $comment)
    {
        $this->topic = $topic;
        $this->comment = $comment;
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
            'topic_id' => $this->topic->id,
            'comment_id' => $this->comment->id,
            'commenter_name' => $this->comment->user->name,
            'message' => 'New reply on your topic: ' . $this->topic->title,
            'url' => route('forum-topics.show', $this->topic->id),
        ];
    }
}
