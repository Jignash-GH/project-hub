const supabase = window.supabase.createClient(
  'https://saiwoplazovvaztltcbc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhaXdvcGxhem92dmF6dGx0Y2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDkzOTEsImV4cCI6MjA1ODk4NTM5MX0.z0va3mMnUmiaNxgvET6HR41tfYJbEPCovk14HF6SCKE'
);

document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    showProjects();
  }
});

function updateYearOptions() {
  const department = document.getElementById('department').value;
  const yearSelect = document.getElementById('year');
  yearSelect.innerHTML = '<option value="">Select Year</option>';

  if (department === 'ACSE') {
    yearSelect.innerHTML += '<option value="2022">2022</option>';
    yearSelect.innerHTML += '<option value="2023">2023</option>';
    yearSelect.innerHTML += '<option value="2024">2024</option>';
  } else if (department === 'CSE') {
    yearSelect.innerHTML += '<option value="2021">2021</option>';
    yearSelect.innerHTML += '<option value="2022">2022</option>';
    yearSelect.innerHTML += '<option value="2023">2023</option>';
    yearSelect.innerHTML += '<option value="2024">2024</option>';
  } else if (department === 'EEE') {
    yearSelect.innerHTML += '<option value="2021">2021</option>';
    yearSelect.innerHTML += '<option value="2022">2022</option>';
    yearSelect.innerHTML += '<option value="2023">2023</option>';
    yearSelect.innerHTML += '<option value="2024">2024</option>';
  }
}

function openReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');
}

function closeReviewModal() {
  const modal = document.getElementById('reviewModal');
  modal.classList.add('fade-out');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
  }, 300);
}

document.querySelectorAll('.star-rating').forEach(ratingGroup => {
  ratingGroup.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      ratingGroup.dataset.rating = value;
      updateStars(ratingGroup, value);
    });
  });
});

function updateStars(ratingGroup, value) {
  ratingGroup.querySelectorAll('.star').forEach(star => {
    const starValue = parseInt(star.dataset.value);
    star.classList.toggle('active', starValue <= value);
  });
}

function validateReviewForm() {
  const userName = document.getElementById('userName').value;
  const interfaceRating = document.getElementById('interfaceRating').dataset.rating;
  const contentRating = document.getElementById('contentRating').dataset.rating;
  const usabilityRating = document.getElementById('usabilityRating').dataset.rating;
  const feedbackSuggestion = document.getElementById('feedback').value;

  if (!userName || !interfaceRating || !contentRating || !usabilityRating || !feedbackSuggestion) {
    alert('All fields are required!');
    return false;
  }
  return true;
}

async function submitReview(event) {
  event.preventDefault();

  const reviewData = {
    user_name: document.getElementById('userName').value,
    interface_rating: parseInt(document.getElementById('interfaceRating').dataset.rating),
    content_rating: parseInt(document.getElementById('contentRating').dataset.rating),
    usability_rating: parseInt(document.getElementById('usabilityRating').dataset.rating),
    feedback_suggestion: document.getElementById('feedback').value
  };

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData]);

    if (error) throw error;

    alert('Recorded successfully');
    document.getElementById('reviewForm').reset();
    resetStarRatings();
    closeReviewModal();
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to record the review. Please try again.');
  }
}

function resetStarRatings() {
  document.querySelectorAll('.star-rating').forEach(ratingGroup => {
    ratingGroup.dataset.rating = 0;
    ratingGroup.querySelectorAll('.star').forEach(star => {
      star.classList.remove('active');
    });
  });
}

async function showProjects() {
  const department = document.getElementById('department').value;
  const year = document.getElementById('year').value;
  const container = document.getElementById('projectsContainer');

  if (!department || !year) {
    container.innerHTML = `
      <div class="no-projects">
        <h3>Please select both department and year</h3>
      </div>
    `;
    return;
  }

  try {
    const { data: deptData } = await supabase
      .from('departments')
      .select('id')
      .eq('name', department)
      .single();

    const { data: yearData } = await supabase
      .from('years')
      .select('id')
      .eq('year', year)
      .single();

    if (!deptData || !yearData) {
      throw new Error('Department or year not found');
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('department_id', deptData.id)
      .eq('year_id', yearData.id);

    if (error) throw error;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="no-projects">
          <h3>No projects found for ${department} - Year ${year}</h3>
          <p>Please select a different department or year.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="projects-summary">
        Found ${projects.length} projects for ${department} - ${year}
      </div>
      <div class="projects-grid">
        ${projects.map(project => createProjectCard(project)).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error fetching projects:', error);
    container.innerHTML = `
      <div class="no-projects">
        <h3>Error fetching projects</h3>
        <p>Please try again later.</p>
      </div>
    `;
  }
}

function createProjectCard(project) {
  return `
    <div class="project-card" onclick="redirectToRepository('${project.repository}')">
      <img src="${project.image}" alt="${project.title}" class="project-image">
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        ${project.team ? `
          <div class="project-info">
            <p>${project.team}</p>
          </div>
        ` : ''}
        ${project.description ? `
          <p class="project-description">${project.description}</p>
        ` : ''}
      </div>
    </div>
  `;
}

function redirectToRepository(url) {
  if (url && url !== '#') {
    window.open(url, '_blank');
  }
}

async function viewReviews() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  const reviewsList = document.getElementById('reviewsList');

  if (reviewsContainer.style.display === 'block') {
    reviewsContainer.style.display = 'none';
    return;
  }

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*');

    if (error) throw error;

    if (reviews.length === 0) {
      reviewsList.innerHTML = `
        <div class="no-reviews">
          <h4>No reviews available</h4>
          <p>Be the first to leave a review!</p>
        </div>
      `;
    } else {
      reviewsList.innerHTML = reviews
        .map(review => createReviewItem(review))
        .join('');
    }

    reviewsContainer.style.display = 'block';
  } catch (error) {
    console.error('Error fetching reviews:', error);
    reviewsList.innerHTML = `
      <div class="no-reviews">
        <h4>Error fetching reviews</h4>
        <p>Please try again later.</p>
      </div>
    `;
    reviewsContainer.style.display = 'block';
  }
}

function createReviewItem(review) {
  return `
    <div class="review-item">
      <h4>${review.user_name}</h4>
      <p><strong>Interface Rating:</strong> ${review.interface_rating} / 5</p>
      <p><strong>Content Rating:</strong> ${review.content_rating} / 5</p>
      <p><strong>Usability Rating:</strong> ${review.usability_rating} / 5</p>
      <p><strong>Feedback/Suggestion:</strong> ${review.feedback_suggestion}</p>
    </div>
  `;
}

function openViewReviewsModal() {
  const modal = document.getElementById('viewReviewsModal');
  modal.style.display = 'block';
}

function closeViewReviewsModal() {
  const modal = document.getElementById('viewReviewsModal');
  modal.style.display = 'none';
}

async function viewReviews() {
  const viewReviewsList = document.getElementById('viewReviewsList');

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*');

    if (error) throw error;

    if (reviews.length === 0) {
      viewReviewsList.innerHTML = `
        <div class="no-reviews">
          <h4>No reviews available</h4>
          <p>Be the first to leave a review!</p>
        </div>
      `;
    } else {
      viewReviewsList.innerHTML = reviews
        .map(review => createReviewItem(review))
        .join('');
    }

    openViewReviewsModal();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    viewReviewsList.innerHTML = `
      <div class="no-reviews">
        <h4>Error fetching reviews</h4>
        <p>Please try again later.</p>
      </div>
    `;
    openViewReviewsModal();
  }
}

function createReviewItem(review) {
  return `
    <div class="review-item">
      <h4>${review.user_name}</h4>
      <p><strong>Interface Rating:</strong> ${review.interface_rating} / 5</p>
      <p><strong>Content Rating:</strong> ${review.content_rating} / 5</p>
      <p><strong>Usability Rating:</strong> ${review.usability_rating} / 5</p>
      <p><strong>Feedback/Suggestion:</strong> ${review.feedback_suggestion}</p>
    </div>
  `;
}


function openAboutUsModal() {
    const modal = document.getElementById('aboutUsModal');
    modal.style.display = 'flex';
}


function closeAboutUsModal() {
    const modal = document.getElementById('aboutUsModal');
    modal.style.display = 'none';
}


document.getElementById('aboutUsLink').addEventListener('click', (event) => {
    event.preventDefault();
    openAboutUsModal();
});