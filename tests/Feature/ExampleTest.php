<?php

it('returns a redirect to api documentation', function () {
    $response = $this->get('/');

    $response->assertStatus(302);
    $response->assertRedirect('/api/documentation');
});
