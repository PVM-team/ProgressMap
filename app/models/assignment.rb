class Assignment < ActiveRecord::Base
	
	belongs_to :course
	has_one :location, dependent: :destroy
	
	has_many :students_tasks, dependent: :destroy
	has_many :doers, through: :students_tasks, :source => :user

	validates :course_id, numericality: { only_integer: true }
end