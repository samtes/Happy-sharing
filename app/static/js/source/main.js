(function(){

  'use strict';

  $(document).ready(initialize);
  var row;

  function initialize(){
    $(document).foundation();
    $('#set-share').click(displayShareSetter);
    $('#update-payment').click(displayPayUpdater);
    $('#update-member').click(displayMemberUpdater);
    $('#view-members').click(toggle);
    $('#close').click(displayShareSetter);
    $('#close-pay-form').click(displayPayUpdater);
    $('#close-member-form').click(displayMemberUpdater);
    $('.remove_member').click(removeMember);
  }

  function removeMember(){
    debugger;
    if(confirm('Are you sure you want to delete this member?')){
      row = this;
      var memberId = $(this).closest('tr').attr('id');
      var accountId = window.location.pathname.slice(18);
      var url = '/accounts/members/'+ accountId + '/' + memberId;
      var type = 'PUT';
      var success = removeRow;
      console.log({url:url, type:type, success:success});
      $.ajax({url:url, type:type, success:success});
    } else {
      alert('not deleting!');
    }
  }

  function removeRow(data){
    console.log(data);
    if (data.state === true){
      $(row).closest('tr').remove();
    }
  }

  function displayMemberUpdater(){
    $('#container-member').toggleClass('hide');
  }

  function displayShareSetter(){
    $('#container').toggleClass('hide');
  }

  function displayPayUpdater(){
    $('#container-payment').toggleClass('hide');
  }

  function toggle(){
    $('#members').toggleClass('hide');
    if($('#view-members a').text() === 'View Members'){
      $('#view-members a').text('Hide Members');
    } else {
      $('#view-members a').text('View Members');
    }
  }


})();

