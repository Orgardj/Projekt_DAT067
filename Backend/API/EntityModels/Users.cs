﻿using System;
using System.Collections.Generic;

namespace API.EntityModels
{
    public partial class Users
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string First_name { get; set; }
        public string Last_name { get; set; }
    }
}