<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserAuthController extends Controller
{
    private function session(User $u)
    {
        return response()->json(['token' => $u->createToken($u->role)->plainTextToken, 'user' => $u->only('id', 'name', 'email', 'role')]);
    }

    public function register(Request $request)
    {
        $data = $request->validate(['first_name' => 'required|string|max:80', 'last_name' => 'required|string|max:80', 'email' => 'required|email:rfc|max:150|unique:users,email', 'password' => 'required|string|min:8|confirmed']);
        $user = User::create(['name' => $data['first_name'].' '.$data['last_name'], 'email' => $data['email'], 'password' => Hash::make($data['password']), 'role' => 'user', 'is_active' => true]);

        return response()->json(['token' => $user->createToken('user')->plainTextToken, 'user' => $user->only('id', 'name', 'email', 'role')], 201);
    }

    public function login(Request $request)
    {
        return $this->attempt($request, 'user');
    }

    public function adminLogin(Request $r)
    {
        return $this->attempt($r, 'admin');
    }

    private function attempt(Request $r, string $role)
    {
        $c = $r->validate(['email' => 'required|email', 'password' => 'required']);
        $u = User::where('email', $c['email'])->where('role', $role)->first();
        if (! $u || ! $u->is_active || ! Hash::check($c['password'], $u->password)) {
            throw ValidationException::withMessages(['email' => ['Email or password is incorrect.']]);
        }

        return $this->session($u);
    }

    public function me(Request $r)
    {
        return $r->user()->only('id', 'name', 'email', 'role');
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
