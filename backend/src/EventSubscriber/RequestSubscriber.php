<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class RequestSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onRequest', 2049]
        ];
    }

    public function onRequest(RequestEvent $event): ?JsonResponse
    {
        if($event->getRequest()->getMethod() === 'OPTIONS') {
            return new JsonResponse('preflight ok', 200);
        }

        return null;
    }
}