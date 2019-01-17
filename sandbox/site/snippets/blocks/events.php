<section class="events">
  <?php foreach ($data->eventlist()->toStructure() as $event): ?>
    <div class="events__item">
      <svg class="events__icon" id="icon-calendar" viewBox="0 0 16 16" width="100%" height="100%">
        <path d="M15 2h-2V0h-2v2H9V0H7v2H5V0H3v2H1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 12H2V5h12v9z"></path>
        <path d="M4 7h2v2H4V7zM7 7h2v2H7V7zM4 10h2v2H4v-2zM7 10h2v2H7v-2zM10 7h2v2h-2V7zM10 10h2v2h-2v-2z"></path>
      </svg>
      <h1 class="events__headline"><?= $event->title()->kt() ?></h1>
      <?php echo $event->date("Y-m-d") ?>
      <p><?= $event->text() ?></p>
    </div>
  <?php endforeach ?>
</section>