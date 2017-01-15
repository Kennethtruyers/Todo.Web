using System.IO;
using System.Linq;
using System.Web.Hosting;
using System.Web.Http;
using Todo.Web.Application;

namespace Todo.Web.Controllers
{
    [RoutePrefix("Tasks")]
    public class TasksController : ApiController
    {
        readonly TaskService _taskService;
        public TasksController()
        {
            _taskService = new TaskService(HostingEnvironment.MapPath("~/App_data/"));
        }

        [Route("{email}")]
        public IHttpActionResult PostTask(string email, Task task) => Ok(_taskService.AddTask(email, task));

        [Route("{email}")]
        public IHttpActionResult PutTask(string email, Task task) => Ok(_taskService.UpdateTask(email, task));

        [Route("{email}/{id:int}")]
        public IHttpActionResult DeleteTask(string email, int id)
        {
            _taskService.DeleteTask(email, id);
            return Ok();
        }
        [Route("{email}")]
        public IHttpActionResult GetAllTasks(string email) => Ok(_taskService.GetAllTasks(email));

        [Route("{email}/{id:int}")]
        public IHttpActionResult GetTaskById(string email, int id) => Ok(_taskService.GetTaskById(email, id));
        [Route("{email}/done")]
        public IHttpActionResult GetCompletedTasks(string email) => Ok(_taskService.GetCompletedTasks(email));

        [Route("{email}/pending")]
        public IHttpActionResult GetPendingTasks(string email) => Ok(_taskService.GetPendingTasks(email));

        [Route("{email}/overdue")]
        public IHttpActionResult GetOverDueTasks(string email) => Ok(_taskService.GetOverDueTasks(email));
    }

   

    [RoutePrefix("Accounts")]
    public class AccountController : ApiController
    {
        [Route("")]
        public IHttpActionResult GetEmails()
        {
            return Ok(Directory.GetFiles(HostingEnvironment.MapPath("~/App_data/"))
                               .Select(Path.GetFileName)
                               .Select(f => f.Replace("tasks_", "")
                                             .Replace(".json", "")));
        }
    }
}