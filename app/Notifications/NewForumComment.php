<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ForumComment;

class NewForumComment extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public ForumComment $comment)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('A new comment has been posted on a forum topic you are following.')
                    ->line('Topic: ' . $this->comment->topic->title)
                    ->action('View Topic', route('forum-topics.show', $this->comment->topic))
                    ->line('Thank you for your participation!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'topic_id' => $this->comment->topic->id,
            'title' => $this->comment->topic->title,
            'message' => 'A new comment has been posted on "' . $this->comment->topic->title . '".',
        ];
    }
}
