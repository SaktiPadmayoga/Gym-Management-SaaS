<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\Cookie;

class CookieService
{
    /**
     * Staff cookie — path=/ agar berlaku di semua halaman
     */
    public static function makeStaffCookie(string $token): Cookie
    {
        return cookie(
            name:     'staff_token',
            value:    $token,
            minutes:  480,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    /**
     * Owner cookie — terpisah dari staff_token agar sesi owner & staff bisa
     * berjalan bersamaan di tab browser yang berbeda.
     */
    public static function makeOwnerCookie(string $token): Cookie
    {
        return cookie(
            name:     'owner_token',
            value:    $token,
            minutes:  480,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function makeMemberCookie(string $token): Cookie
    {
        return cookie(
            name:     'member_token',
            value:    $token,
            minutes:  10080,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function makeAdminCookie(string $token): Cookie
    {
        return cookie(
            name:     'admin_token',
            value:    $token,
            minutes:  480,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function clearStaffCookie(): Cookie
    {
        return cookie(
            name:     'staff_token',
            value:    '',
            minutes:  -1,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function clearOwnerCookie(): Cookie
    {
        return cookie(
            name:     'owner_token',
            value:    '',
            minutes:  -1,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function clearMemberCookie(): Cookie
    {
        return cookie(
            name:     'member_token',
            value:    '',
            minutes:  -1,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }

    public static function clearAdminCookie(): Cookie
    {
        return cookie(
            name:     'admin_token',
            value:    '',
            minutes:  -1,
            path:     '/',
            domain:   null,
            secure:   true,
            httpOnly: true,
            sameSite: 'None',
        );
    }
}