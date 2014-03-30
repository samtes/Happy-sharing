(function(){

  'use strict';

  $(document).ready(initialize);

  function initialize(){
    $(document).foundation();
    $('#set-share').click(displayShareSetter);
    $('#update-payment').click(displayPayUpdater);
    $('#update-member').click(displayMemberUpdater);
    $('#view-members').click(toggle);
    $('#close').click(displayShareSetter);
    $('#close-pay-form').click(displayPayUpdater);
    $('#close-member-form').click(displayMemberUpdater);
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

