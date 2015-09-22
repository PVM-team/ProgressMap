class User < ActiveRecord::Base
	
	has_many :memberships, dependent: :destroy
	has_many :courses, through: :memberships
	
	has_many :students_tasks, dependent: :destroy
	has_many :assignments, through: :students_tasks

  validates :firstName, presence: true
  validates :lastName, presence: true
end