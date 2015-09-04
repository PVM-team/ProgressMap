class User < ActiveRecord::Base
	
	has_many :courses
	has_many :assignments
end
	# class Newsletter
      #has_many :subscriptions
      #has_many :subscribers, :through => :subscriptions, :source => :user
    #end