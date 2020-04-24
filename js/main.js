$(document).ready(function(){
    var gallery = null;
	var apiKey = '8D5E9BF2BA11F6Fc91b2bfc9b4b3f2a42476df88bf8bf1f09ec13c0'
	var apiSecret = 'aea3dc554808858cf5895c557d90ba2cbd622b698d3e18101ebe311bf6a15faf'
	var URL = 'http://IR-LT-652:80/gallery/api/v1'
	//var workflowId = '5de96aec7009c14afc64bd3b'
	
    $("#getSubscriptionWorkflows").click(function(){
        //gallery = new Gallery("URL", "apiKey", "apiSecret");
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        
        
        gallery.getSubscriptionWorkflows(function(workflows){
            var listStr = "";
            var len = workflows.length;
            if (len === 0) {
                listStr = "There are no workflows in the subscription associated with the given api key";
            }
            for (var i = 0; i < len; i++){
                listStr += "<li>" + workflows[i].metaInfo.name + " - " + workflows[i].id +  "</li>";
            }
            $("#workflowList").html(listStr);
        }, function(response){
            $("#workflowList").html(response.responseJSON && response.responseJSON.message || response.statusText);
        });
    });

    $("#getAppInterface").click(function(){
        //var workflowId =  "5de96aec7009c14afc64bd3b";
		var workflowId = $('#workflowId').val().trim();
        if (!workflowId) {
            $("#appInterface").html('<span class="red">Please enter an app ID.</span>');
            return;
        }
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        gallery.getAppQuestions(workflowId, function(questions){
            var listStr = "<table>";
            var len = questions.length;
            if (len === 0) {
                listStr = "This app has no questions.";
            }
            for (var i = 0; i < len; i++){
                var question = questions[i];
                listStr += '<tr><td class="name"><label>' + question.description + '</label></td><td><input type="text" class="' + question.type + '" value="' + (question.value || '') + '" name="' + question.description + '">';
                if (question.items){
                    listStr += '<div>options: ';
                    for (var j = 0; j < question.items.length; j++) {
                        listStr += question.items[j].value += (j < question.items.length-1) ? ", " : "";
                    }
                    listStr += '</div>';
                }
                listStr += '</td></tr>';
            }
            listStr += "</table>";
            $("#appInterface").html(listStr);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#appInterface").html('<span class="red">' + error + '</span>');
        });
    });

    $("#executeWorkflow").click(function(){
        //var workflowId =  "5de96aec7009c14afc64bd3b";
		var workflowId = $('#workflowId').val().trim();
        var questions = $("#appInterface").serializeArray();
        console.log(questions)
        //var questions = $("#appInterface").serialize();
        
        if (!workflowId) {
            $("#jobIdDiv").html('<span class="red">please enter a workflow Id.</span>');
            return;
        }
        $("#jobIdDiv").html('');
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        gallery.executeWorkflow(workflowId, questions, function(job){
            $("#jobIdDiv").html('Job Id: ' + job.id);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobIdDiv").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getJobsByWorkflow").click(function(){
        //var workflowId =  "5de96aec7009c14afc64bd3b";
        if (!workflowId) {
            $("#jobsByWorkflow").html('<span class="red">please enter a workflow Id.</span>');
            return;
        }
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        gallery.getJobsByWorkflow(workflowId, function(jobs){
            var job;
            var jobString = "";
            var len = jobs.length;
            if (len === 0) {
                jobString = "This app has never been executed.";
            }
            for (var i = 0; i < len; i++){
                job = jobs[i];
                jobString += "<li>" + new Date(job.createDate).toLocaleString() + " - " + job.id + " - " + job.status + " - " + job.disposition + "</li>";
            }
            $("#jobsByWorkflow").html(jobString);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobsByWorkflow").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getJobStatus").click(function(){
        var jobId = $("#jobId").val().trim();
        if (!jobId) {
            $("#jobDetails").html('<span class="red">please enter a job Id.</span>');
            return;
        }
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        gallery.getJob(jobId, function(job){
            $("#jobDetails").html("<li>" + new Date(job.createDate).toLocaleString() + " - " + job.id + " - " + job.status + " - " + job.disposition + "</li>");
            var outputString = "<ul>";
            var outputs = job.outputs;
            for (var i = 0; i < outputs.length; i++){
                var output = outputs[i];
                outputString += "<li>" + output.name + " - " + output.id + " - [" + output.formats.toString() + "]";
            }
            $("#jobDetails").append(outputString);

            var message;
            var errorString = "<ul>";
            for (var j = 0; j < job.messages.length; j++) {
                message = job.messages[j];
                if (message.status === 3){
                    errorString += "<li>";
                    errorString += message.text += (message.toolId > 0) ? " (Tool Id: " + message.toolId + ")" : "";
                    errorString += "</li>";
                }
            }
            errorString += "</ul>";
            $("#jobDetails").append(errorString);
        }, function(response){
            var error = response.responseJSON && response.responseJSON.message || response.statusText;
            $("#jobDetails").html('<span class="red">' + error + '</span>');
        });
    });

    $("#getOutputFile").click(function(ev){
        var jobId = $("#jobId").val().trim();
        var outputId = $("#outputId").val().trim();
        var format = $("#format").val().trim();
        if (!jobId) {
            $("#outputError").html('<span class="red">please enter a job Id above.</span>');
            return;
        }
        if (!outputId) {
            $("#outputError").html('<span class="red">please enter an output Id.</span>');
            return;
        }
        gallery = new Gallery("URL", "apiKey", "apiSecret");
        var url = gallery.getOutputFileURL(jobId, outputId, format);

        $("#outputError").html('');
        window.location.assign(url);
    });
});
