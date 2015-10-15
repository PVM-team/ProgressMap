class Course < ActiveRecord::Base
	
	has_many :students, dependent: :destroy
	has_many :assignments, dependent: :destroy

	validates_length_of :name, :minimum => 1
end