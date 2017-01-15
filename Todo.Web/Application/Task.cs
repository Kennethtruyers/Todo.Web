using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Todo.Web.Application
{
    public class Task
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime DueDate { get; set; }
        public bool Done { get; set; }
    }
}