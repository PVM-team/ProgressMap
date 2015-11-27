class Assignment < ActiveRecord::Base
	
    belongs_to :course
	has_one :location, dependent: :destroy
	
	has_many :students_tasks, dependent: :destroy
	has_many :attempters, through: :students_tasks, :source => :student

	has_many :assignment_dependencies, dependent: :destroy
	has_many :dependencies, through: :assignment_dependencies	# has_many perässä oleva 'dependencies' kuvaa sitä että assignment_dependencyn kautta Assignment modelin riveihin viittaa foreign_key 'dependency_id'

	validates :number, numericality: { greater_than_or_equal_to: 1 }
	
    validates :name, presence: true
    validates_uniqueness_of :name, :scope => "course_id" # nimi kaikilla tehtävillä uniikki jolla sama course_id

    def doers
        doers = []

        self.students_tasks.each do |task|
            if task.complete and task.student_id
                doers << (Student.find_by id: task.student_id)
            end
        end
        doers
     end

    def to_s
        return "name: " + self.name + ", number: " + self.number.to_s if self.name and self.number
        return "name: " + self.name if self.name
        return "number: " + self.number.to_s if self.number

        super # kutsuu ActiveRecord::Base -luokan to_s metodia
    end
end