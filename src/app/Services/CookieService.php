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
        return cookie('staff_token',  '', -1, '/');
    }

    public static function clearMemberCookie(): Cookie
    {
        return cookie('member_token', '', -1, '/');
    }

    public static function clearAdminCookie(): Cookie
    {
        return cookie('admin_token',  '', -1, '/');
    }
}