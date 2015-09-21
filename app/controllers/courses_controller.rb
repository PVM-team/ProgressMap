class CoursesController < ApplicationController

	def create
		@course = Course.new(course_params)

		if @course.save

			for i in 1..params[:assignment_count]
				@course.assignments << Assignment.new
			end
		end
		render json: @course
	end

	private

		def course_params
			params.require(:course).permit(:name)
		end
end