class User < ActiveRecord::Base
	
	has_many :memberships, dependent: :destroy
	has_many :courses, through: :memberships
	has_many :assignments, through: :students_tasks
end
	# class Newsletter
      #has_many :subscriptions
      #has_many :subscribers, :through => :subscriptions, :source => :user
    #end