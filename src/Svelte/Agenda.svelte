<script>
  import {onMount} from 'svelte';
  import SvelteMarkdown from 'svelte-markdown';
  import { DateTime } from "luxon";
  import simplur from 'simplur';


  export let event;
  export let url;
  export let border_color;
  export let select_color;
  export let text_color;
  export let bg_color;
  export let speaker_border;
  export let category_color;
  export let sub_color;

  let loading = true;
  let load_error = "";

  let agenda_list = [];
  let categories = [];
  let venues = [];
  let available_venues = [];

  let active_tab = ""; 
  let active_venue = ""; 

  async function loadData(){
    var today = DateTime.now().toFormat("LLL dd, yyyy");
    loading = true;
    load_error = "";

    try {
      let response = await fetch(`${url}/api/event/${event}/agenda/venue`);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      let data = await response.json();
      agenda_list = data.agenda ?? {};
      categories = data.categories ?? [];
      venues = data.venues ?? [];
      active_tab = (dates().indexOf(today) >= 0) ? today : dates()[0] ?? "";
    } catch (error) {
      console.error('Agenda embed failed to load data.', error);
      load_error = "Unable to load the agenda right now.";
      agenda_list = {};
      categories = [];
      venues = [];
      active_tab = "";
      active_venue = "";
    } finally {
      loading = false;
    }

  }

  function dates(){
    let dates = Object.keys(agenda_list);
    return dates;
  }

  function venuesForDate(date) {
    return Object.keys(agenda_list?.[date] ?? {}).filter((venue) => {
      const items = agenda_list?.[date]?.[venue];
      return Array.isArray(items) ? items.length > 0 : Boolean(items);
    });
  }

  $: available_venues = venuesForDate(active_tab);
  $: if (!available_venues.length) {
    active_venue = "";
  } else if (!available_venues.includes(active_venue)) {
    active_venue = available_venues[0];
  }

  onMount(async ()=>{
    await loadData();
  });

  function date_format(date, format) {
    let d = DateTime.fromFormat(date, "LLL dd, yyyy");
    return d.toFormat(format);
  }

  function date_single(date){
    let s = DateTime.fromSQL(date);
    return s.toFormat('hh:mm a');
  }

  function date_detail(start, end){
    let s = DateTime.fromSQL(start);
    let e = DateTime.fromSQL(end);

    if(s.hasSame(e, 'day')){
      return s.toFormat('hh:mm a') + " - " + e.toFormat('hh:mm a')
    }
    else{
      return s.toFormat('hh:mm a') + " - " + e.toFormat('hh:mm a')
    }

  }

  function selectTab(date){
    active_tab = date;
  }

  function selectVenue(venue){
    active_venue = venue;
  }

</script>

{#if loading}
  <div class="agenda-loader">
    <div class="agenda-loader__spinner" aria-label="Loading agenda" role="status"></div>
  </div>
{:else if load_error}
  <div class="py-6 text-sm text-red-600">{load_error}</div>
{:else if !dates().length}
  <div class="py-6 text-sm {text_color}">No agenda is available.</div>
{:else}
  <div class="agenda__tabs text-center flex items-center justify-center flex-wrap gap-5 text-white mb-10">
    {#each Object.entries(agenda_list) as [date]}
      <button on:click={() => selectTab(date)} class="px-5 py-2 spl_cursor sm:text-base text-xs rounded-md shadow border {date == active_tab ? select_color : border_color + ' ' + text_color}">
        <span>{date_format(date, 'ccc')}</span>, {date_format(date, 'LLL d, y')}
      </button>
    {/each}
  </div>

  {#if available_venues.length}
    <div class="agenda__tabs text-center flex items-center justify-center flex-wrap gap-5 text-white mb-10">
      {#each available_venues as venue}
        <button on:click={() => selectVenue(venue)} class="px-5 py-2 spl_cursor sm:text-base text-xs rounded-md shadow border {venue == active_venue ? select_color : border_color + ' ' + text_color}">
          <span>{venue}</span>
        </button>
      {/each}
    </div>
  {/if}

  <div id="event-sched1" data-title="Event Schedule">
    {#each Object.entries(agenda_list) as [date, agendas]}
      {#if date == active_tab}
        <div class="w-full max-w-4xl mx-auto mb-5">
          {#each Object.entries(agendas) as [venue, agenda]}
            {#if venue == active_venue}
              {#each agenda as {name, description, start_time, end_time, category, speakers, venue}}
                <div class="{bg_color} {border_color} border px-5 py-3">
                  <div class="flex flex-col md:flex-row md:space-x-5">
                    <div class="{text_color} md:pt-3 flex-shrink-0 min-w-[6rem]">{date_single(start_time)} IST</div>

                    <div class="w-full divide-y divide-gray-600 space-y-4 mb-3">
                      <div class="w-full pt-3">
                        <div class="{category_color} uppercase text-xs">{category ?? ""}</div>
                        <div class="text-lg font-bold max-w-xl {text_color}">{name}</div>

                        {#if description}
                          <div class="mt-4 {text_color} mb-4">
                            <SvelteMarkdown source={description}></SvelteMarkdown>
                          </div>
                        {/if}

                        {#if Object.entries(speakers ?? {}).length}
                          <div class="mt-4 ml-4">
                            {#each Object.entries(speakers) as [category, speaker_list]}
                              <div class="font-bold uppercase {sub_color} mb-3">
                                {simplur`${[speaker_list.length, category]}[|s]`}
                              </div>

                              <div class="flex flex-wrap w-full">
                                {#each speaker_list as {name, designation, organisation, photo, linkedin}}
                                  <div class="flex items-center space-x-4 mb-3 pr-3 md:w-1/2">
                                    <div class="rounded-full flex-shrink-0 w-20 border-r-4 border-b-4 {speaker_border} shadow-lg overflow-hidden">
                                      <img src={photo} alt={name} />
                                    </div>
                                    <div>
                                      <div class="font-bold {text_color}">{name}</div>
                                      <div class="text-xs {sub_color}">{designation}</div>
                                      <div class="text-xs {sub_color}">{organisation ?? ""}</div>
                                    </div>
                                  </div>
                                {/each}
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          {/each}
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .agenda-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    width: 100%;
  }

  .agenda-loader__spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(148, 163, 184, 0.35);
    border-top-color: rgba(15, 23, 42, 0.95);
    border-radius: 9999px;
    animation: agenda-spin 0.7s linear infinite;
  }

  @keyframes agenda-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
