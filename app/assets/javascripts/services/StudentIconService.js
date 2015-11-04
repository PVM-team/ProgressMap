ProgressApp.service('StudentIconService', function () {
	// tällä hetkellä käsittelee 'path.Circlejä'

	this.colorOfCircleOfStudent = function(student) {
		// olettaa että opiskelijoita 9 kpl

        var id = student.id % 9;

    	if (id % 3 == 0) {
        	return "#" + Math.round(55 + 200 * id / 9).toString(16) + "3737";
        }
        else if (id % 3 == 1) {
            return "#37" + Math.round(55 + 200 * id / 9).toString(16) + "37";
        }

        return "#3737" + Math.round(55 + 200 * id / 9).toString(16);	
	}
})