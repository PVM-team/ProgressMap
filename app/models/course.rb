require 'securerandom'

class Course < ActiveRecord::Base
	before_create :generate_token

	has_many :students, dependent: :destroy
	has_many :assignments, dependent: :destroy

	validates_length_of :name, :minimum => 1

	private

		def generate_token
        	uuid = SecureRandom.uuid
        
        	while Course.find_by token: uuid
        	  uuid = SecureRandom.uuid
        	end

        	self.token = uuid
      	end
end