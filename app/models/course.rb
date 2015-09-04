class Course < ActiveRecord::Base
	
	has_many :assignments, dependent: :destroy
	has_many :users
end
