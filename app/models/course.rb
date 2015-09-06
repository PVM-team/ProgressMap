class Course < ActiveRecord::Base
	
	has_many :memberships, dependent: :destroy
	has_many :participants, through: :memberships, source: :user
	
	has_many :assignments, dependent: :destroy
end