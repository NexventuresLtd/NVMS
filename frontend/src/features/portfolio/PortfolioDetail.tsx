import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Users,
  Star,
} from "lucide-react";
import portfolioApi from "../../services/portfolioApi";
import type { Portfolio } from "../../types/portfolio";
import { formatDate } from "../../lib/utils";

export const PortfolioDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      loadProject(slug);
    }
  }, [slug]);

  const loadProject = async (projectSlug: string) => {
    try {
      setIsLoading(true);
      const data = await portfolioApi.getProject(projectSlug);
      setProject(data);
    } catch (err) {
      setError("Failed to load project details");
      console.error("Error loading project:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Project Not Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {error || "The requested project could not be found."}
                </p>
                <Link to="/portfolio">
                  <Button variant="primary">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Portfolio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/portfolio">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolio
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <Card className="mb-8">
          <div className="aspect-w-16 aspect-h-9">
            {project.featured_image ? (
              <img
                src={project.featured_image}
                alt={project.title}
                className="w-full h-64 md:h-80 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center rounded-t-lg">
                <span className="text-2xl font-bold text-primary-600">
                  {project.title}
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                {project.client_name && (
                  <p className="text-lg text-gray-600">
                    Client:{" "}
                    <span className="font-medium">{project.client_name}</span>
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                {project.project_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(project.project_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </Button>
                )}
                {project.repository_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(project.repository_url, "_blank")
                    }
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Source Code
                  </Button>
                )}
              </div>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed">
              {project.description}
            </p>
          </CardContent>
        </Card>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Timeline</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Started:</span>{" "}
                  {formatDate(project.start_date)}
                </p>
                {project.end_date && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Completed:</span>{" "}
                    {formatDate(project.end_date)}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span>{" "}
                  {project.duration_display}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Team</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Team Size:</span>{" "}
                  {project.team_size} member{project.team_size !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Project Type:</span>{" "}
                  {project.project_type.replace("_", " ")}
                </p>
                {project.budget_range && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Budget:</span>{" "}
                    {project.budget_range}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Metrics</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Views:</span>{" "}
                  {project.views_count.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === "published"
                        ? "bg-green-100 text-green-800"
                        : project.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </p>
                {project.is_featured && (
                  <p className="text-sm text-gray-600">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      Featured Project
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-3">
                {project.technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="px-3 py-2 text-sm font-medium rounded-lg"
                    style={{
                      backgroundColor: `${tech.color}15`,
                      color: tech.color,
                      border: `1px solid ${tech.color}30`,
                    }}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tech Stack Details */}
        {(project.tech_stack_frontend ||
          project.tech_stack_backend ||
          project.tech_stack_database ||
          project.tech_stack_deployment) && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Technical Stack
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.tech_stack_frontend && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Frontend</h4>
                    <p className="text-gray-600">
                      {project.tech_stack_frontend}
                    </p>
                  </div>
                )}
                {project.tech_stack_backend && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Backend</h4>
                    <p className="text-gray-600">
                      {project.tech_stack_backend}
                    </p>
                  </div>
                )}
                {project.tech_stack_database && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Database</h4>
                    <p className="text-gray-600">
                      {project.tech_stack_database}
                    </p>
                  </div>
                )}
                {project.tech_stack_deployment && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Deployment
                    </h4>
                    <p className="text-gray-600">
                      {project.tech_stack_deployment}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Description */}
        {project.detailed_description && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Project Details
              </h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {project.detailed_description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Features */}
        {project.key_features && project.key_features.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Key Features
              </h3>
              <ul className="space-y-2">
                {project.key_features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Challenges & Solutions */}
        {project.challenges_faced && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Challenges & Solutions
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.challenges_faced}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Lessons Learned */}
        {project.lessons_learned && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Lessons Learned
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {project.lessons_learned}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Testimonials */}
        {project.testimonials && project.testimonials.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Client Testimonials
              </h3>
              <div className="space-y-6">
                {project.testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="border-l-4 border-primary-200 pl-6"
                  >
                    <p className="text-gray-600 italic mb-3">
                      "{testimonial.testimonial_text}"
                    </p>
                    <div className="flex items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {testimonial.client_name}
                        </p>
                        {testimonial.client_position &&
                          testimonial.client_company && (
                            <p className="text-sm text-gray-500">
                              {testimonial.client_position} at{" "}
                              {testimonial.client_company}
                            </p>
                          )}
                      </div>
                      <div className="ml-auto flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {project.gallery_images && project.gallery_images.length > 0 && (
          <Card className="mb-8">
            <CardContent>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Project Gallery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.gallery_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${project.title} screenshot ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
