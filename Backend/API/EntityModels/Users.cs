﻿using System;
using System.Collections.Generic;

namespace NGCI.EntityModels
{
    public partial class Users
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
