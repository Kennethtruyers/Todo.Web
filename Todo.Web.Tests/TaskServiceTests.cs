using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Todo.Web.Application;
using Xunit;

namespace Todo.Web.Tests
{
    public class TaskServiceTestBase : IDisposable
    {
        protected readonly TaskService Subject;
        protected const string User = "test@test.com";
        protected const string OtherUser = "othertest@test.com";
        readonly string _directory = Directory.GetCurrentDirectory() + "\\results\\" + Guid.NewGuid();
        protected TaskServiceTestBase()
        {
            Subject = new TaskService(_directory);
        }


        public void Dispose() =>
            deleteDirectory(_directory);

        static void deleteDirectory(string directory)
        {
            foreach (var file in Directory.GetFiles(directory))
            {
                File.SetAttributes(file, FileAttributes.Normal);
                File.Delete(file);
            }

            foreach (var dir in Directory.GetDirectories(directory))
                deleteDirectory(dir);

            Directory.Delete(directory, false);
        }
    }
    public class CreatingANewTask : TaskServiceTestBase
    {
        readonly Task _newTask;
        public CreatingANewTask()
        {
            _newTask = Subject.AddTask(User, new Task {Name = "test", DueDate = DateTime.Now.AddDays(1)});
        }

        [Fact] public void ReturnsTheNewTask() => _newTask.Should().NotBeNull();
        [Fact] public void SetsTheIdOfTheTask() => _newTask.Id.Should().NotBe(0);
        [Fact] public void CanRetrieveTheTaskForThatUser() => Subject.GetAllTasks(User).Should().Contain(t => t.Id == _newTask.Id);
        [Fact] public void CanRetrieveTheTaskByIdForThatUser() => Subject.GetTaskById(User, _newTask.Id).Should().NotBeNull();
        [Fact] public void CannotRetrieveTheTaskForAnotherUser() => Subject.GetTaskById(OtherUser, _newTask.Id).Should().BeNull();
    }

    public class CreatingMultipleTasks : TaskServiceTestBase
    {
        readonly List<Task> _tasks;
        public CreatingMultipleTasks()
        {
            _tasks = Enumerable.Range(0, 5)
                               .Select(i => Subject.AddTask(User, new Task { Name = "test" + i, DueDate = DateTime.Now.AddDays(1) }))
                               .ToList();
        }

        [Fact] public void ReturnsAllTasks() => _tasks.Should().NotContainNulls();
        [Fact] public void SetsTheIdOfAllTasks() => _tasks.ForEach(t => t.Id.Should().NotBe(0));
        [Fact] public void CreatesUniqueIds() => _tasks.Select(t => t.Id).Should().OnlyHaveUniqueItems();
    }

    public class UpdatingATask : TaskServiceTestBase
    {
        readonly Task _initialTask;
        readonly Task _updatedTask;
        const string NewName = "test2";
        readonly DateTime _newDueDate = DateTime.Now.AddDays(2);
        public UpdatingATask()
        {
            _initialTask = Subject.AddTask(User, new Task { Name = "test", DueDate = DateTime.Now.AddDays(1) });
            _updatedTask = Subject.UpdateTask(User, new Task { Id = _initialTask.Id, Name = NewName, DueDate = _newDueDate });

        }
        [Fact] public void ReturnsTheUpdatedTask() => _updatedTask.Should().NotBeNull();
        [Fact] public void DoesNotModifyTheTaskId() => _updatedTask.Id.Should().Be(_initialTask.Id);
        [Fact] public void UpdatesTheName() => _updatedTask.Name.Should().Be(NewName);
        [Fact] public void UpdatesTheDueDate() => _updatedTask.DueDate.Should().Be(_newDueDate);
    }

    public class CompletingATask : TaskServiceTestBase
    {
        readonly Task _task;
        public CompletingATask()
        {
            _task = Subject.AddTask(User, new Task { Name = "test", DueDate = DateTime.Now.AddDays(1) });
            _task.Done = true;
            Subject.UpdateTask(User, _task);

        }
        [Fact] public void ReturnsTheTaskIdInTheEntireList() => Subject.GetAllTasks(User).Should().Contain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInTheCompleteList() => Subject.GetCompletedTasks(User).Should().Contain(t => t.Id == _task.Id);
        [Fact] public void DoesNotReturnTheTaskInTheOverdueList() => Subject.GetOverDueTasks(User).Should().NotContain(t => t.Id == _task.Id);
        [Fact] public void DoesNotReturnTheTaskInThePendingList() => Subject.GetPendingTasks(User).Should().NotContain(t => t.Id == _task.Id);
    }

    public class CreatingAnOverdueTask : TaskServiceTestBase
    {
        readonly Task _task;
        public CreatingAnOverdueTask()
        {
            _task = Subject.AddTask(User, new Task { Name = "test", DueDate = DateTime.Now.AddDays(-1) });
        }
        [Fact] public void ReturnsTheTaskIdInTheEntireList() => Subject.GetAllTasks(User).Should().Contain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInTheCompleteList() => Subject.GetCompletedTasks(User).Should().NotContain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInTheOverdueList() => Subject.GetOverDueTasks(User).Should().Contain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInThePendingList() => Subject.GetPendingTasks(User).Should().Contain(t => t.Id == _task.Id);
    }

    public class CreatingAPendingTaskThatIsNotOverdue : TaskServiceTestBase
    {
        readonly Task _task;
        public CreatingAPendingTaskThatIsNotOverdue()
        {
            _task = Subject.AddTask(User, new Task { Name = "test", DueDate = DateTime.Now.AddDays(1) });
        }
        [Fact] public void ReturnsTheTaskIdInTheEntireList() => Subject.GetAllTasks(User).Should().Contain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInTheCompleteList() => Subject.GetCompletedTasks(User).Should().NotContain(t => t.Id == _task.Id);
        [Fact] public void DoesNotReturnTheTaskInTheOverdueList() => Subject.GetOverDueTasks(User).Should().NotContain(t => t.Id == _task.Id);
        [Fact] public void ReturnsTheTaskIdInThePendingList() => Subject.GetPendingTasks(User).Should().Contain(t => t.Id == _task.Id);
    }

    public class DeletingATask : TaskServiceTestBase
    {
        readonly Task _initialTask;
        public DeletingATask()
        {
            _initialTask = Subject.AddTask(User, new Task { Name = "test", DueDate = DateTime.Now.AddDays(1) });
            Subject.DeleteTask(User, _initialTask.Id);

        }
        [Fact] public void RemovesTask() => Subject.GetTaskById(User, _initialTask.Id).Should().BeNull();
    }
}
