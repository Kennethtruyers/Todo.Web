using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Newtonsoft.Json;

namespace Todo.Web.Application
{
    public class TaskService
    {
        readonly string _filePath;

        public TaskService(string filePath)
        {
            _filePath = filePath;
            if (!Directory.Exists(_filePath))
                Directory.CreateDirectory(_filePath);
        }

        public Task AddTask(string email, Task task) => withTasks(email, tasks =>
        {
            task.Id = tasks.Any()
                    ? tasks.Max(t => t.Id) + 1
                    : 1;
            tasks.Add(task);
            return task;
        });


        public Task UpdateTask(string email, Task task) => withTasks(email, tasks =>
        {
            tasks.Remove(tasks.FirstOrDefault(t => t.Id == task.Id));
            tasks.Add(task);
            return task;
        });       
        public void DeleteTask(string email, int id) => withTasks(email, tasks => tasks.Remove(tasks.FirstOrDefault(t => t.Id == id)));
        public List<Task> GetAllTasks(string email) => getTasks(email);
        public Task GetTaskById(string email, int id) => getTasks(email).FirstOrDefault(t => t.Id == id);
        public List<Task> GetCompletedTasks(string email) => getTasks(email).Where(t => t.Done).ToList();

        public List<Task> GetPendingTasks(string email) => getTasks(email).Where(t => !t.Done).ToList();

        public List<Task> GetOverDueTasks(string email) => getTasks(email).Where(t => !t.Done && t.DueDate < DateTime.Now).ToList();

        string getPath(string email) => _filePath + "/tasks_" + email + ".json";
        List<Task> getTasks(string email)
        {
            var path = getPath(email);
            return !File.Exists(path)
                    ? new List<Task>()
                    : JsonConvert.DeserializeObject<List<Task>>(File.ReadAllText(getPath(email)));
        }
        T withTasks<T>(string email, Func<List<Task>, T> callback)
        {
            var path = getPath(email);
            var tasks = getTasks(email);
            var result = callback(tasks);
            File.WriteAllText(path, JsonConvert.SerializeObject(tasks));
            return result;
        }
    }
}