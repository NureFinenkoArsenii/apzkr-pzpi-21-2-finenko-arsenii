using Microsoft.IdentityModel.Tokens;
using System;
using System.Text;
namespace SmartWarDrones.Auth
{
    public class AuthOptions
    {
        public const string Issuer = "SmartWarDrones";
        public const string Audience = "http://localhost";
        public static readonly TimeSpan Lifetime =
       TimeSpan.FromHours(3);
        private const string Key = "TGl2ZSBhIGhhcHB5IGFuZCBwcm9kdWN0aXZlIGxpZmUsIGFuZCBjZWxlYnJhdGUgdGhlIGV4cGVyaWVuY2Uu";
        public static SymmetricSecurityKey
       GetSymmetricSecurityKey()
        {
            return new
           SymmetricSecurityKey(Convert.FromBase64String(Key));
        }
    }
}
