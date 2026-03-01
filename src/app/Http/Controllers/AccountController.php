<?php

// app/Http/Controllers/AccountController.php
namespace App\Http\Controllers;

use App\Models\Account;
use App\Http\Requests\StoreAccountRequest;
use App\Http\Requests\UpdateAccountRequest;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function index()
    {
        return response()->json([
            'message' => 'List accounts',
            'data' => Account::with('tenants')->get()
        ]);
    }

    public function store(StoreAccountRequest $request)
    {
        $account = Account::create([
            'name' => $request->name,
            'email' => $request->email,
            'company_name' => $request->company_name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'message' => 'Account created successfully',
            'data' => $account
        ], 201);
    }

    public function show(Account $account)
    {
        return response()->json([
            'message' => 'Account detail',
            'data' => $account->load('tenants')
        ]);
    }

    public function update(UpdateAccountRequest $request, Account $account)
    {
        $account->update([
            'name' => $request->name,
            'email' => $request->email,
            'company_name' => $request->company_name,
            'phone' => $request->phone,
            'status' => $request->status,
            'password' => $request->password 
                ? Hash::make($request->password) 
                : $account->password
        ]);

        return response()->json([
            'message' => 'Account updated successfully',
            'data' => $account
        ]);
    }

    public function destroy(Account $account)
    {
        $account->delete();

        return response()->json([
            'message' => 'Account deleted successfully'
        ]);
    }
}
