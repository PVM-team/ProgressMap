class Student < ActiveRecord::Base
	
	belongs_to :course
	
	has_many :students_tasks, dependent: :destroy
	has_many :assignments, through: :students_tasks

  validates :firstName, presence: true
  validates :lastName, presence: true

  	def latest_done_assignment(course)
  		latest_done_assignment = []

  		tasks = self.students_tasks
  		last_done = nil
      
  		tasks.each do |task|

  			if (Assignment.find_by id: task.assignment_id).course === course

          if last_done
            last_done = task if task1_done_after_task2(task, last_done)
          else
            last_done = task
          end
  			end
  		end

      if last_done
        { 'number': (Assignment.find_by id: last_done.assignment_id).number, 'timestamp': last_done.updated_at }
  	  else
        nil
      end
    end

  	def task1_done_after_task2(task1, task2)
  		task1.updated_at > task2.updated_at
  	end
end