<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLikeNotification extends Notification
{
    use Queueable;

    public $liker;
    public $type;
    public $model;

    /**
     * Create a new notification instance.
     */
    public function __construct($liker, $type, $model)
    {
        $this->liker = $liker;
        $this->type = $type; // 'topic' or 'comment'
        $this->model = $model;
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
        $url = $this->type === 'topic' 
            ? '/forum/' . $this->model->id 
            : '/forum/' . $this->model->forum_topic_id;

        return [
            'type' => 'new_like',
            'message' => $this->liker->name . ' liked your ' . $this->type . '.',
            'url' => $url,
            'liker_id' => $this->liker->id,
            'model_id' => $this->model->id,
            'model_type' => $this->type,
            'created_at' => now(),
        ];
    }
}
