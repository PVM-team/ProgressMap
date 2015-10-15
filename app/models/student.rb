class Student < ActiveRecord::Base
	
	belongs_to :course
	
	has_many :students_tasks, dependent: :destroy
	has_many :assignments, through: :students_tasks

  validates :firstName, presence: true
  validates :lastName, presence: true

  	def last_done_assignment
  		last_done = nil
      
  		self.students_tasks.each do |task|
        last_done = task if task_done_after_last_done(task, last_done)
  		end

      return { 'number': (Assignment.find_by id: last_done.assignment_id).number, 'timestamp': last_done.updated_at } if last_done
      nil
    end


    private
  	
      def task_done_after_last_done(task, last_done)
        return task.updated_at > last_done.updated_at if last_done
        true
      end
end