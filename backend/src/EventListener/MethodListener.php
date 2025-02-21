<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MethodListener implements EventSubscriberInterface {
    public function onKernelResponse(ResponseEvent $responseEvent): void
    {
        if ($responseEvent->getRequest()->getMethod() === 'OPTIONS')
        {
            $res = $responseEvent->getResponse();
            $res->setStatusCode(200);
            $responseEvent->setResponse($res);
        }
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::RESPONSE => 'onKernelResponse',
        ];
    }
}