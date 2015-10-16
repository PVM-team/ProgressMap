class Assignment < ActiveRecord::Base
	before_create :set_name
	
	belongs_to :course
	has_one :location, dependent: :destroy
	
	has_many :students_tasks, dependent: :destroy
	has_many :doers, through: :students_tasks, :source => :student

	has_many :assignment_dependencies, dependent: :destroy
	has_many :dependencies, through: :assignment_dependencies	# has_many perässä oleva 'dependencies' kuvaa sitä että assignment_dependencyn kautta Assignment modelin riveihin viittaa foreign_key 'dependency_id'

    validates :number, numericality: { greater_than_or_equal_to: 1 }


    private
    	
    	def set_name
    		self.name = ""
    	end
end
